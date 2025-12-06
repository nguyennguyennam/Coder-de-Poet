import React from "react";

const CoursePlaylist = ({ lessons, currentLesson, setCurrentLesson, loading, getThumbnail }) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-3 text-sm text-gray-500">Đang tải bài học...</p>
      </div>
    );
  }

  if (!lessons || lessons.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">📚</div>
        <p className="text-gray-500 text-sm">Chưa có bài học nào</p>
      </div>
    );
  }

  return (
    <div className="w-80 h-[calc(90vh_+_6px)] bg-white rounded-2xl shadow-xl p-4 sticky top-10 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
        <h2 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
          📖 Nội dung khóa học
        </h2>
        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
          {lessons.length} bài học
        </span>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-500">Đang tải bài học...</p>
        </div>
      ) : lessons.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📚</div>
          <p className="text-gray-500 text-sm">Chưa có bài học nào</p>
        </div>
      ) : (
        <div className="space-y-2 p-1 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => setCurrentLesson(lesson)}
              className={`flex items-center gap-3 w-full text-left p-2 rounded-lg transition-all duration-200 border ${
                currentLesson?.id === lesson.id
                  ? "bg-blue-50 border-blue-300 shadow-sm"
                  : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              {/* Thumbnail */}
              <div className="relative">
                <img
                  src={getThumbnail(lesson.content_url)}
                  alt={lesson.title}
                  className="w-28 h-16 object-cover rounded-md"
                />
                {/* Duration badge */}
                {lesson.duration && (
                  <span className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                    {lesson.duration}
                  </span>
                )}
                {/* Active overlay */}
                {currentLesson?.id === lesson.id && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-md flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {lesson.position && (
                    <span
                      className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                        currentLesson?.id === lesson.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {lesson.position}
                    </span>
                  )}
                  <span
                    className={`text-sm font-medium truncate ${
                      currentLesson?.id === lesson.id
                        ? "text-blue-700"
                        : "text-gray-900"
                    }`}
                  >
                    {lesson.title}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


export default CoursePlaylist;