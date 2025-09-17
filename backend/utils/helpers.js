/**
 * Async wrapper to catch errors in async route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Send standardized success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} data - Response data
 */
export const sendSuccessResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message,
    ...(data && { data })
  };
  
  res.status(statusCode).json(response);
};

/**
 * Send standardized error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 */
export const sendErrorResponse = (res, statusCode = 500, message = 'Server Error') => {
  res.status(statusCode).json({
    success: false,
    message
  });
};

/**
 * Paginate results
 * @param {Object} query - Mongoose query object
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Number of items per page
 * @returns {Object} Pagination info and results
 */
export const paginate = async (query, page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items per page
  const skip = (pageNum - 1) * limitNum;

  const [results, total] = await Promise.all([
    query.skip(skip).limit(limitNum),
    query.model.countDocuments(query.getQuery())
  ]);

  const totalPages = Math.ceil(total / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;

  return {
    results,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalItems: total,
      itemsPerPage: limitNum,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? pageNum + 1 : null,
      prevPage: hasPrevPage ? pageNum - 1 : null
    }
  };
};

/**
 * Generate random string
 * @param {number} length - Length of random string
 * @returns {string} Random string
 */
export const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};