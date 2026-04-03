function checkRole(allowedRoles){
    return (req, res, next)=>{
        const role = req.headers.role;

        if(!role){
            return res.status(400).json({message: "Role header missing"});
        }

        if(!allowedRoles.includes(role)){
            return res.status(403).json({message: "Acces Denied"});
        }

        next();
    };
}

module.exports = checkRole;