// const asyncHandler =(fn)=>async (req,res,next)=>{
// try{
//   console.log("control first reached here");
//   await fn(req,res,next)
// }
// catch(err){
//     res.status(err.code || 500).json({
//         success:false,
//         message:err.message
//     })
// }
// }

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
   //   console.error(" Error in Controller:", err.message);
     // console.error("Stack Trace:", err.stack);
      next(err);
    });
  };
};

export { asyncHandler };
