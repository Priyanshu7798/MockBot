"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Form,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { NextResponse } from "next/server"
import { toast } from "sonner"
import FormField from "./FormField"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/firebase/client"
import { signIn, signUp } from "@/lib/actions/auth.action"

const authFormSchema = (type:FormType)=>{
    return z.object({
        name: type === 'sign-up' ? z.string().min(5) : z.string().optional(),
        email: z.string().email(),
        password : z.string().min(5),
    })
}


const AuthForm = ({type}:{type:FormType}) => {
    const formSchema = authFormSchema(type);


    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })
    
    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)

        try {
        
            if(type === 'sign-up'){
                
                const {name ,email , password} = values;

                const userCredentials = await createUserWithEmailAndPassword(auth,email,password);

                const res = await signUp({
                    uid: userCredentials.user.uid,
                    name: name!,
                    email,
                    password,
                })

                if(!res?.success){
                    toast.error(res?.message);
                    return;
                }

                toast.success("Account created successfully")
                router.push('/sign-in')
                return NextResponse.json({
                    message:"Sign UP",
                    success: true,
                    values: values,
                },{status: 200})

            }else{

                const {email , password} = values;

                const userCredentials = await signInWithEmailAndPassword(auth,email ,password);

                const idToken = await userCredentials.user.getIdToken();

                if(!idToken){
                    toast.error("Sign In Failed")
                    return;
                }

                await signIn({
                    email,idToken
                })

                toast.success("User Signed In")
                router.push('/')

                return NextResponse.json({
                    message:"Sign In",
                    success: true,
                    values: values,
                },{status: 200})
            }
        
        } catch (error) {
            toast.error(`there was a error ${error}`)
            return NextResponse.json({message: 'something went wrong'},{status:500})
        }
    }


    const isSignIn = type === 'sign-in'
    const router = useRouter();

  return (
    <div className="card-border lg:min-w-[566px]">

        <div className="flex flex-col gap-6 card py-14 px-10">
            <div className="flex flex-row gap-2 justify-center">
                <Image src='/logo.svg' height={32} width={38} alt="logo" />
                <h2 className="text-primary-100">MockBot</h2>
            </div>

            <h3>Practice Job Interview With AI...</h3>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">

                    {!isSignIn && (
                        <FormField 
                            control={form.control}
                            name="name"
                            label = "Name"
                            placeholder="Your Name ..."
                        />
                    )}
                    <FormField 
                        control={form.control}
                        name="email"
                        label = "Email"
                        placeholder="Your Email ..."
                        type = 'email'
                    />
                    <FormField 
                        control={form.control}
                        name="password"
                        label = "Password"
                        placeholder="Your Password ..."
                        type="password"
                    />
                    
                    <Button className="btn" type="submit">
                        {isSignIn? 'Sign in' : 'Create An Account'}
                    </Button>
                </form>
            </Form>

            <p className="text-center">
                {isSignIn ? 'No Account Yet!! ': "Have An Account Already "}
                <Link className="font-bold text-user-primary ml-1" href={!isSignIn? '/sign-in': '/sign-up'}>
                    {!isSignIn ? 'Sign In' :'Sign Up'}
                </Link>
            </p>
        </div>
    </div>
  )
}

export default AuthForm