const mongoose=require("mongoose");
const Feedback=require("../models/Feedback");

const createFeedback=async (req, res) => {
  try {
    const { studentName, courseName, message, rating }=req.body;
    if (!studentName || !courseName || !message || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "studentName, courseName, message and rating are required",
      });
    }
    const numericRating=Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5",
      });
    }
    const feedback = await Feedback.create({
      studentName,
      courseName,
      message,
      rating: numericRating,
    });
    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getFeedback = async (req, res) => {
  try {
    const page=parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit=parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip=(page-1)*limit;
    const totalRecords = await Feedback.countDocuments();
    const feedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      data: feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updateFeedbackStatus=async (req, res) => {
  try {
    const {id} = req.params;
    const {status}=req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback ID",
      });
    }
    if (!["Pending","Reviewed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either Pending or Reviewed",
      });
    }
    const feedback=await Feedback.findByIdAndUpdate(id,
        { status },{ new: true, runValidators: true }
    );
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Feedback status updated",
      data: feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports={createFeedback,getFeedback,updateFeedbackStatus};