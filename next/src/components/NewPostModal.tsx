import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress"
import { newPostSchema } from "@/lib/schemas";
import { Feather, Image as Img, Loader2 } from "lucide-react";
import Image from 'next/image';
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Post } from "@/lib/types";
import TextareaAutosize from 'react-textarea-autosize';

type PostData = z.infer<typeof newPostSchema>;

export default function NewPostModal() {
    const [text, setText] = useState('');
    const maxChars = 280;
    const charsPercentage = Math.min((text.length / maxChars) * 100, 100);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PostData>({ resolver: zodResolver(newPostSchema) });

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    const handleOpenChange = (open: boolean) => {
        if (open) {
            setText('');
            reset();
        }
    };

    const onSubmit = async (data: PostData) => {
        if (isSubmitting) return;

        try {
            const response = await fetch('/api/createpost', {
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
        <Dialog onOpenChange={handleOpenChange}>
            <DialogTrigger className='post-btn'>
                <Feather className='feather-icon' />
                <p>Post</p>
            </DialogTrigger>
            <DialogContent className="w-[90%] sm:max-w-[550px]">
                <div className="grid grid-cols-post-layout mt-4 min-h-[60px] sm:min-h-[80px]">
                    <Image src='/blackLogo.png' alt='User profile' width={30} height={30} className="w-fit" />
                    <form onSubmit={handleSubmit(onSubmit)} id='postForm' className='pr-4'>
                        <TextareaAutosize
                            maxLength={maxChars}
                            className='h-[200px] sm:h-[175px] w-full focus:outline-none text-xl resize-none'
                            placeholder='What is happening?!'
                            {...register("text", {
                                onChange: (e) => handleTextChange(e),
                            })} 
                        />
                    </form>
                </div>
                <Progress value={charsPercentage} className='mt-auto' />
                {charsPercentage === 100 && <p className='text-center text-red-600 font-bold text-xs'>Max characters reached</p>}
                {errors.text && (
                    <p className="text-center text-red-600 font-bold text-xs">{`${errors.text.message}`}</p>
                )}
                <DialogFooter>
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
            </DialogContent>
        </Dialog>
    )
}
