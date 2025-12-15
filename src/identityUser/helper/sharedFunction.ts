import bcrypt from "bcrypt";
import identityUser_passwordHistory from "../lib/models/identityUser_passwordHistory";



export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

export const comparePassword = async (inputPassword: string, userPassword: string) => {
    const valid = await bcrypt.compare(inputPassword, userPassword);
    return valid;
}


export const checkOldPassword = async (userId: string, newPassword: string) => {
    const passwordHistory = await identityUser_passwordHistory.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10);

    for (const item of passwordHistory) {
        const match = await comparePassword(newPassword, item.passwordHash);
        if (match) {
            return false;
        }
    }
    return true;
}

export const savePasswordToHistory = async (userId: string, HashedNewPassword: string) => {
    await identityUser_passwordHistory.create({
        user: userId,
        passwordHash: HashedNewPassword
    });

    // 6) if history have more then 10 row oldesd find and delete
    const total = await identityUser_passwordHistory.countDocuments({ user: userId });
    if (total > 10) {

        const toRemove = total - 10;
        await identityUser_passwordHistory.find({ user: userId })
            .sort({ createdAt: 1 }) // oldest first
            .limit(toRemove)
            .then(docs => {
                const ids = docs.map(d => d._id);
                if (ids.length) {
                    return identityUser_passwordHistory.deleteMany({ _id: { $in: ids } });
                }
                return null;
            });
    }
}


export const checkPasswordExpire = (passwordLastChanged: Date) => {
    const lastChanged = new Date(passwordLastChanged).getTime();
    const expireDays = Number(process.env.PASSWORD_EXPIRE_DAYS) || 0;
    const expired = Date.now() - lastChanged > expireDays * 24 * 60 * 60 * 1000;
    return expired;
}


