import { useState, useEffect } from "react";
import { showToast } from "../../config/toastConfig";
import axios from "../../services/axios";
import { FiStar, FiSend, FiEdit3, FiCheck } from "react-icons/fi";

const RateTeacher = ({ teacher, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingRating, setHasExistingRating] = useState(false);
  const [existingRatedAt, setExistingRatedAt] = useState(null);

  // Fetch existing rating when component mounts
  useEffect(() => {
    const fetchExistingRating = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/student/rating/${teacher._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data.success) {
          const data = response.data.data;
          setHasExistingRating(data.hasRated);
          setRating(data.rating);
          setReview(data.review);
          setExistingRatedAt(data.ratedAt);
        }
      } catch (error) {
        console.error("Failed to fetch existing rating:", error);
        showToast.error("Failed to load existing rating");
      } finally {
        setIsLoading(false);
      }
    };

    if (teacher?._id) {
      fetchExistingRating();
    }
  }, [teacher._id]);

  const handleSubmitRating = async () => {
    if (rating === 0) {
      showToast.warning("Please select a rating");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await axios.post(
        "/student/rate-teacher",
        {
          teacherId: teacher._id,
          rating: rating,
          review: review.trim(),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        if (onRatingSubmitted) {
          onRatingSubmitted();
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to submit rating";
      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="flex space-x-1 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-8 h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
          {hasExistingRating ? (
            <>
              <FiEdit3 className="text-blue-600" />
              <span>Update Your Rating</span>
            </>
          ) : (
            <>
              <FiStar className="text-yellow-500" />
              <span>Rate Prof. {teacher.name}</span>
            </>
          )}
        </h3>
        <p className="text-slate-600 text-sm">
          {hasExistingRating
            ? `You rated this teacher on ${new Date(
                existingRatedAt
              ).toLocaleDateString()}`
            : "Share your experience with this teacher"}
        </p>
      </div>

      {/* Existing Rating Banner */}
      {hasExistingRating && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <FiCheck className="text-blue-600" />
            <span className="text-blue-800 font-medium">
              Your Current Rating
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`text-lg ${
                    star <= rating
                      ? "text-yellow-500 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-blue-700 font-medium">
              {rating} out of 5 stars
            </span>
          </div>
          {review && (
            <p className="text-blue-700 text-sm mt-2 italic">"{review}"</p>
          )}
        </div>
      )}

      {/* Star Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {hasExistingRating ? "Update Your Rating" : "Your Rating"}
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="text-2xl transition-all duration-200 hover:scale-110"
            >
              <FiStar
                className={`${
                  star <= (hoveredRating || rating)
                    ? "text-yellow-500 fill-current"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-500 mt-1">
          {rating > 0 && (
            <>
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </>
          )}
        </p>
      </div>

      {/* Review Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {hasExistingRating
            ? "Update Your Review (Optional)"
            : "Review (Optional)"}
        </label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience with this teacher..."
          rows={3}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmitRating}
        disabled={isSubmitting || rating === 0}
        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
          isSubmitting || rating === 0
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : hasExistingRating
            ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
            : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full"></div>
            <span>{hasExistingRating ? "Updating..." : "Submitting..."}</span>
          </>
        ) : (
          <>
            {hasExistingRating ? <FiEdit3 /> : <FiSend />}
            <span>{hasExistingRating ? "Update Rating" : "Submit Rating"}</span>
          </>
        )}
      </button>

      {/* Note */}
      <p className="text-xs text-slate-400 text-center mt-3">
        {hasExistingRating
          ? "You can update your rating and review anytime"
          : "You can edit your rating later if needed"}
      </p>
    </div>
  );
};

export default RateTeacher;
