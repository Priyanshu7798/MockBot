"use client"

import { interviewer } from '@/constants';
import { cn } from '@/lib/utils';
import { vapi } from '@/lib/vapi.sdk';
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface SavedMessage {
    role: 'user' | 'system' | 'assistant',
    content: string,
}

const Agent = ({userName ,userId , type, interviewId ,questions} :AgentProps) => {

    const router = useRouter()

    const [isBotSpeaking, setIsBotSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE)
    const[messages,setMessages] = useState<SavedMessage[]>([]);


    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
        console.log('Generate the feedback here');

        // TODO: create a service action that generates the feedback
        
        const {success, id} = {
            success: true,
            id: 'feedback-id'
        }

        if(success && id) {
            router.push(`/interview/${interviewId}/feedback`)
        }else{
            console.log("Error saving feedback");
            router.push('/')
        }
    }



    useEffect(()=>{

        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd  = () => setCallStatus(CallStatus.FINISHED);

        const onMessage = (message : Message)=>{
            if(message.type ==='transcript' && message.transcriptType ==='final') {
                const newMessage = {role: message.role , content: message.transcript}

                setMessages((prev)=>[...prev, newMessage])
            }
        }

        const onSpeechStart = () =>setIsBotSpeaking(true);
        const onSpeechEnd = () =>setIsBotSpeaking(false);
        const onError = (error:Error) => console.log('Error', error);

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message',onMessage);
        vapi.on('speech-start',onSpeechStart);
        vapi.on('speech-end',onSpeechEnd);
        vapi.on('error',onError);

        return ()=>{
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message',onMessage);
            vapi.off('speech-start',onSpeechStart);
            vapi.off('speech-end',onSpeechEnd);
            vapi.off('error',onError);
        }
    },[])

    useEffect(()=>{
        if(callStatus === CallStatus.FINISHED) {
            if(type === 'generate'){
                router.push('/')
            }else{
                handleGenerateFeedback(messages)
            }
        }
    },[messages,callStatus,type,userId])


    const handleCall = async () =>{
        setCallStatus(CallStatus.CONNECTING);

        if(type === 'generate') {
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
                variableValues: {
                    username: userName,
                    userid : userId,
                }
            })
        }else{

            let formattedQuestions = '';

            if(questions) {
                formattedQuestions = questions
                    .map((ques) => ` - ${ques}`)
                    .join('\n');
            }

            await vapi.start(interviewer , {
                variableValues: {
                    questions: formattedQuestions,
                }
            })

        }

    };

    const handleDisconnect = async () =>{
        setCallStatus(CallStatus.FINISHED);

        vapi.stop();
    };

    const latestMessage = messages[messages.length-1]?.content;
    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  return (
    <>
        <div className='call-view'>
            {/* AI BOT */}
            <div className='card-interviewer'>
                <div className='avatar'>
                    <Image src='/ai-avatar.png' alt='vapi' width={65} height={54} className='object-cover' />

                    {isBotSpeaking && <span className='animate-speak' />}
                </div>

                <h3>AI Interviewer</h3>
            </div>

            {/* User Card */}
            <div className='card-border'>
                <div className='card-content'>
                    <Image src='/user-avatar.png' alt='user_avatar' width={540} height={540} className='rounded-full object-cover size-[120px]'/>
                    <h3>{userName}</h3>
                </div>
            </div>
        </div>

        {/* render the transcript */}

        {messages.length >0 && (
            <div className='transcript-border mt-5'>
                <div className='transcript'>
                    <p key={latestMessage} className= {cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>
                        {latestMessage}
                    </p>
                </div>
            </div>
        )}


        {/* Call Button  */}

        <div className='w-full flex justify-center mt-5'>
            {callStatus !== 'ACTIVE' ? (
                <button className='relative btn-call' onClick={handleCall}>
                    <span
                        className={cn("absolute animate-ping rounded-full opacity-75",
                            callStatus !== "CONNECTING" && "hidden"
                        )}
                    />

                    <span className="relative">
                        {isCallInactiveOrFinished ? "Call": ". . ."}
                    </span>
                </button>
            ) : (
                <button className='btn-disconnect' onClick={handleDisconnect}>
                    END
                </button>
            )}
        </div>
    </>
  )
}

export default Agent