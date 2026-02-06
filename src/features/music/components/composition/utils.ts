export const CREATOR_ID_KEY = 'composition_creator_id';
export const MY_SONGS_KEY = 'composition_my_songs';

export const getCreatorId = () => {
    let id = localStorage.getItem(CREATOR_ID_KEY);
    if (!id) {
        id = Math.random().toString(36).substring(2, 15);
        localStorage.setItem(CREATOR_ID_KEY, id);
    }
    return id;
};

export const generateShortId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};
