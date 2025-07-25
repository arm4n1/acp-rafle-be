import { Request, Response } from "express";
import * as Yup from "yup";

import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";

type TRegister = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type TLogin = {
  identifier: string;
  password: string;
};

const registerValidateSchema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  username: Yup.string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: Yup.string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref('password')], "Passwords must match"),
});

export default {
  async register(req: Request, res: Response) {
    const { fullName, username, email, password, confirmPassword } =
      req.body as unknown as TRegister;

    try {
      // Validasi input dengan Yup
      await registerValidateSchema.validate({
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });

      // Cek apakah username sudah ada
      const existingUsername = await UserModel.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({
          message: "Username already exists. Please choose a different username.",
          data: null,
        });
      }

      // Cek apakah email sudah ada
      const existingEmail = await UserModel.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          message: "Email already exists. Please use a different email address.",
          data: null,
        });
      }

      // Enkripsi password sebelum menyimpan
      const hashedPassword = encrypt(password);

      // Buat user baru
      const result = await UserModel.create({
        fullName,
        email,
        username,
        password: hashedPassword,
      });

      // Hapus password dari response untuk keamanan
      const userResponse = {
        _id: result._id,
        fullName: result.fullName,
        username: result.username,
        email: result.email,
      };

      res.status(201).json({
        message: "Registration successful",
        data: userResponse,
      });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },

  async login(req: Request, res: Response) {
    const { identifier, password } = req.body as unknown as TLogin;
    
    try {
      // Validasi input dasar
      if (!identifier || !password) {
        return res.status(400).json({
          message: "Identifier and password are required",
          data: null,
        });
      }

      // Ambil data user berdasarkan "identifier" -> email atau username
      const userByIdentifier = await UserModel.findOne({
        $or: [
          { email: identifier },
          { username: identifier },
        ],
      });

      if (!userByIdentifier) {
        return res.status(401).json({
          message: "Invalid credentials",
          data: null,
        });
      }

      // Validasi password
      const validatePassword: boolean =
        encrypt(password) === userByIdentifier.password;

      if (!validatePassword) {
        return res.status(401).json({
          message: "Invalid credentials",
          data: null,
        });
      }

      // Hapus password dari response untuk keamanan
      const userResponse = {
        _id: userByIdentifier._id,
        fullName: userByIdentifier.fullName,
        username: userByIdentifier.username,
        email: userByIdentifier.email
        
      };

      res.status(200).json({
        message: "Login successful",
        data: userResponse,
      });
      
    } catch (error) {
      const err = error as unknown as Error;
      res.status(500).json({
        message: "Internal server error",
        data: null,
      });
    }
  },
};
