function checkRole(allowedRoles){
    return (req, res, next)=>{
        const role = req.user.role;

        if(!role){
            return res.status(400).json({message: "Role missing from token"});
        }

        if(!allowedRoles.includes(role)){
            return res.status(403).json({message: "Access Denied"});
        }

        next();
    };
}

module.exports = checkRole;