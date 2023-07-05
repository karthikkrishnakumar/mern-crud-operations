import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public

/**
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login User
 *     operationId: login
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: email
 *          description: "Your email"
 *          type: string
 *        - in: query
 *          name: password
 *          description: "Your password"
 *          type: string
 *     responses:
 *       200:
 *         description: Success
 *       422:
 *         description: Unprocessable Entity
 *       401:
 *         description: Unauthenticated
 */
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.query;

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: token,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public

/**
 * @swagger
 * /register:
 *   post:
 *     tags:
 *       - User
 *     summary: Register New User
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: name
 *          description: User name
 *          type: string
 *        - in: query
 *          name: email
 *          description: User email address
 *          type: string
 *        - in: query
 *          name: password
 *          description: Your password
 *          type: string
 *     responses:
 *       200:
 *         description: Success
 *       422:
 *         description: Unprocessable Entity
 *       401:
 *         description: Unauthenticated
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
/**
 * @swagger
 * /logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout user
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *       422:
 *         description: Unprocessable Entity
 *       401:
 *         description: Unauthenticated
 */
const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
/**
 * @swagger
 * /profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Return logged in user details
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *       422:
 *         description: Unprocessable Entity
 *       401:
 *         description: Unauthenticated
 */
const getUserProfile = asyncHandler(async (req, res) => {
  if (req.user) {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
/**
 * @swagger
 * /update:
 *   post:
 *     tags:
 *       - Users
 *     summary: Update User Profile
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: name
 *          description: User name
 *          type: string
 *        - in: query
 *          name: email
 *          description: User email address
 *          type: string
 *        - in: query
 *          name: password
 *          description: Your password
 *          type: string
 *     responses:
 *       200:
 *         description: Success
 *       422:
 *         description: Unprocessable Entity
 *       401:
 *         description: Unauthenticated
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Delete user profile
// @route   DELETE /api/users/profile
// @access  Private
/**
 * @swagger
 * /delete:
 *   post:
 *     tags:
 *       - User
 *     summary: Delete User by email
 *     produces:
 *       - application/json
 *     parameters:
 *        - in: query
 *          name: email
 *          description: User email address
 *          type: string
 *     responses:
 *       200:
 *         description: Success
 *       422:
 *         description: Unprocessable Entity
 *       401:
 *         description: Unauthenticated
 */
const deleteUserProfile = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const deleted = await User.deleteOne({ email });
    if (deleted) {
      res.json({ message: "User profile deleted successfully" });
    }
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    List user profiles
// @route   GET /api/users/profiles
// @access  Private/Admin

/**
 * @swagger
 * /list:
 *   post:
 *     tags:
 *       - User
 *     summary: List all user
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *       422:
 *         description: Unprocessable Entity
 *       401:
 *         description: Unauthenticated
 */
const listUserProfiles = asyncHandler(async (req, res) => {
  const users = await User.find({});
  const message = "User profiles retrieved successfully";
  res.json({ message, users });
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  listUserProfiles,
};
