function errorsMiddleware(err, req, res, next) {
  console.log('[Errors Middleware]:\n', err.stack);
  res.status(500).send({ success: false, message: err.message });
}

export default errorsMiddleware;