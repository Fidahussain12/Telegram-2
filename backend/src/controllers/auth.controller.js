import {generateToken} from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import {sendWelcomeEmail} from "../emails/emailHandlers.js";
import { ENV } from "../lib/env.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;


  try {
    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    //check if email is valid regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address" });
    }
    const user = await User.findOne({ email});

    if(user) return res.status(400).json({message: "Email Already Exists"})

        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword =  await bcrypt.hash(password,salt)

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })

        if(newUser){
        

            const savedUser = await newUser.save();
            generateToken(savedUser._id, res);

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });


            try {
              await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
            } catch (error) {
              console.error("Error sending welcome email:", error);
            }
        }
        else{
            res.status(400).json({message: "Invalid User Data"})
        }
  } catch (error) {
    console.log("Error in signup controller:", error)
    res.status(500).json({ message: "Server Error" })
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if(!user) return res.status(400).json({message: "Invalid Email or Password"});

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if(!isPasswordCorrect) return res.status(400).json({message: "Invalid Email or Password"});

    generateToken(user._id, res)

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const logout = async (_, res) => {

  res.cookie("jwt","",{maxAge: 0});
  res.status(200).json({message: "Logged Out Successfully"});
};
