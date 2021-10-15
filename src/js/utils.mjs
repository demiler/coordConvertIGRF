export const padNumber = (num, size) => {
    let s = String(num);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

export const clamp = (min, max, val) => {
    return Math.min(max, Math.max(min, val));
}

