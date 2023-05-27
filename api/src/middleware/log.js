const logRequest = (req,res,next) => {
    console.log('log terjadi req ke PATH', req.path);
    next();
}

module.exports = logRequest;