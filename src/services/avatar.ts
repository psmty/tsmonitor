export const isInitialsAllowed = (name: string) => {
    if (/[`~!@#$%^&*()_|+\-=?;:'"\d,.<>\{\}\[\]\\\/]/gi.test(name)) {
        return '';
    }
    return name;
};

export const getNameInitials = (name: string | null) => {
    // strip our numbers and underscores;
    const numStripped = name?.replace(/[0-9_]/g, '');
    if (!numStripped) {
        return '';
    }

    // separate the words using word boundaries, and strip all non alphabets
    const words = numStripped.match(/(^\S|\b\S)?/g)!.join('')!.replace(/[^a-z]/gi, '');

    return words!.match(/(^\S|\S$)?/g)!.join('').toUpperCase() ?? '';
};
