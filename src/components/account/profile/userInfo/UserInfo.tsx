
export default function UserInfo({ username, name, email, phoneNumber }:
    {
        username?: string;
        name?: string;
        email?: string;
        phoneNumber?: string;
    }) {


    return (

        <div className="w-full  flex flex-row flex-wrap justify-evenly items-center gap-2  p-2  shadow-xl shadow-black rounded-xl mb-5  ">
            <b className="font-bold text-lg text-black text-shadow-xs text-shadow-black text-start w-full">User Info</b>

            <div className="flex flex-col justify-center items-center gap-1 ">
                <label className="block text-sm ">Username</label>
                <input type="text" className="input-style text-center" disabled readOnly defaultValue={username} />
            </div>
            <div className="flex flex-col justify-center items-center gap-1">
                <label className="block text-sm"> Name</label>
                <input type="text" className="input-style text-center" disabled readOnly defaultValue={name} />
            </div>
            <div className="flex flex-col justify-center items-center gap-1">
                <label className="block text-sm"> Email </label>
                <input type="text" className="input-style text-center" disabled readOnly defaultValue={email} />
            </div>

            <div className="flex flex-col justify-center items-center gap-1">
                <label className="block text-sm"> phoneNumber </label>
                <input type="text" className="input-style text-center" disabled readOnly defaultValue={phoneNumber} />
            </div>

        </div>

    );
}
