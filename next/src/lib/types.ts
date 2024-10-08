export interface User {
    id: string,
    username: string,
    dateOfBirth: string,
    email: string,
    password: string,
};

export interface Post {
    id: number,
    content: string,
    createdAt: Date,
    updatedAt: Date,
    authorId: number,
    replyToId: number | null,
};

export interface UserInfo {
    username: string;
    email: string;
    dateOfBirth: Date;
    profile: {
        name: string;
        bio: string;
        location: string;
        websiteUrl: string;
        profilePicture: string;
        bannerPicture: string;
    },
};

export interface PostInfoType {
    id: number,
    content: string,
    createdAt: string,
    updatedAt: string,
    authorId: number,
    replyToId: number | null,
    author: {
        username: string,
        profile: {
            name: string,
            profilePicture: string,
        } | null;
    };
};