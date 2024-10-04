'use client';
import { Button } from "@/components/ui/button"
import {
    DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress"
import { newPostSchema } from "@/lib/schemas";
import { Image as Img, Loader2 } from "lucide-react";
import Image from 'next/image';
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Post } from "@/lib/types";
import TextareaAutosize from 'react-textarea-autosize';
import { useUserContext } from "@/context/UserContextProvider";

type PostData = z.infer<typeof newPostSchema>;

export default function NewPost() {
    const [text, setText] = useState('');
    const maxChars = 280;
    const charsPercentage = Math.min((text.length / maxChars) * 100, 100);
    const router = useRouter();
    const { user } = useUserContext();


    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PostData>({ resolver: zodResolver(newPostSchema) });

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    const onSubmit = async (data: PostData) => {
        if (isSubmitting) return;

        try {
            const response = await fetch('/api/createPost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error);
            }

            const postData = await response.json() as Post;

            console.log(postData);

            router.push(`/post/${postData.id}`);
        } catch (error) {
            console.error(error);
            reset();
        }
    };

    return (
        <div className="border-y h-fit min-h-[175px] flex flex-col">
            <div className="grid grid-cols-post-layout gap-2 mt-4 h-full">
                <Image src={`http://localhost:3001/public/profilePictures/${user.profile?.profilePicture}`}
                    alt='User profile'
                    width={50} height={50}
                    className="rounded-full" />
                <form onSubmit={handleSubmit(onSubmit)} id='postForm' className='pr-4'>
                    <TextareaAutosize maxLength={maxChars}
                        className='w-full focus:outline-none text-xl resize-none mt-1'
                        placeholder='What is happening?!'
                        {...register("text", {
                            onChange: (e) => handleTextChange(e),
                        })} />
                </form>
            </div>
            <Progress value={charsPercentage} className='mt-auto' />
            {charsPercentage === 100 && <p className='text-center text-red-600 font-bold text-xs'>Max characters reached</p>}
            {errors.text && (
                <p className="text-center text-red-600 font-bold text-xs">{`${errors.text.message}`}</p>
            )}
            <DialogFooter className="pb-4">
                <Img size={24} className="text-[hsl(var(--primary))]" />
                {isSubmitting
                    ? (<Button disabled className='ml-auto font-bold w-fit rounded-3xl text-white-1'>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting
                    </Button>)
                    : (<Button type="submit"
                        className='ml-auto font-bold w-fit rounded-3xl text-white-1'
                        disabled={text.length > 280}
                        form='postForm'
                    >
                        Post
                    </Button>)
                }
            </DialogFooter>
        </div>
    )
}
