const calage=(dob)=>{
    const today=Date.now();
    let age=today.getFullYear()-dob.getFullYear();
    if(today.getMonth()<dob.getMonth() || (today.getMonth()===dob.getMonth() && today.getDate()<dob.getDate())){
        age--;
    }
    return age;
}