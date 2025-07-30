import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    department: String,
    subject: String,
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
    availableSlots: [Date],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    resetToken: String,
    resetTokenExpiry: Date,

    lastLogin: {
      type: Date,
      default: null, // Start with null, update on login
    },
    profile: {
      bio: String,
      experience: Number,
      education: String,
      specializations: [String],
      officeHours: String,
      contactInfo: {
        phone: String,
        office: String,
      },
      yeeId: String,
      designation: String, // Professor, Assistant Professor, etc.
      qualification: [String], // PhD, Masters, etc.
      experience: Number, // years of experience
      specialization: [String],
      profilePicture: String,
      bio: String,
      researchInterests: [String],
      publications: [
        {
          title: String,
          journal: String,
          year: Number,
          url: String,
        },
      ],
      socialLinks: {
        linkedin: String,
        researchGate: String,
        googleScholar: String,
        website: String,
      },
      officeHours: {
        days: [String], // Monday, Tuesday, etc.
        startTime: String,
        endTime: String,
        location: String,
      },
    },

    // Rating system
    ratings: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        review: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalRatings: {
      type: Number,
      default: 0,
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
teacherSchema.pre("save", function (next) {
  if (this.ratings && this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10; // Round to 1 decimal
    this.totalRatings = this.ratings.length;
  } else {
    this.averageRating = 0;
    this.totalRatings = 0;
  }
  this.updatedAt = Date.now();
  next();
});

const Teacher = mongoose.model("Teacher", teacherSchema);
export default Teacher;
