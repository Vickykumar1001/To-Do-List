exports.getDate=function(){                       // module.exports=exports
    var options={
    weekday:"long" ,
    day:"numeric" ,
    month:"long"
};
var today=new Date();
return today.toLocaleDateString("en-US",options);
};
exports.getDay=function(){
    var options={
    weekday:"long"
};
var today=new Date();
return today.toLocaleDateString("en-US",options);
};