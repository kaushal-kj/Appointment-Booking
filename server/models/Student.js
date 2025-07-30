import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null, // Start with null, update on login
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    resetToken: String,
    resetTokenExpiry: Date,

    // Profile fields
    profile: {
      studentId: String,
      course: String,
      year: String,
      section: String,
      cgpa: Number,
      phone: String,
      address: String,
      bio: String,
      profilePicture: String,
      dateOfBirth: Date,
      subjectsOfInterest: [String],
      careerGoals: [String],
      socialLinks: {
        linkedin: String,
        github: String,
      },

      studentId: String, // University/College ID
      course: String,
      year: {
        type: String,
        enum: [
          "1st Year",
          "2nd Year",
          "3rd Year",
          "4th Year",
          "Graduate",
          "Post Graduate",
        ],
      },
      semester: String,
      department: String,
      profilePicture: String, // URL to profile image
      bio: String,
      interests: [String],
      emergencyContact: {
        name: String,
        phone: String,
        relationship: String,
      },
    },

    // Metadata
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Update the updatedAt field before saving
studentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Student = mongoose.model("Student", studentSchema);
export default Student;
