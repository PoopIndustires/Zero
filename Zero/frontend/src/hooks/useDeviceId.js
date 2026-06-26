import { useEffect, useState } from "react";

const KEY = "zp_device_id";

function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export function useDeviceId() {
    const [id, setId] = useState(null);
    useEffect(() => {
        let existing = localStorage.getItem(KEY);
        if (!existing) {
            existing = uuid();
            localStorage.setItem(KEY, existing);
        }
        setId(existing);
    }, []);
    return id;
}
