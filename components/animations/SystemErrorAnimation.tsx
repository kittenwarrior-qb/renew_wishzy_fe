'use client';
import { useEffect } from 'react';
import { useRive, useStateMachineInput } from 'rive-react';

type SystemErrorRiveProps = {
    showError: boolean; // true nếu lỗi xuất hiện
    width?: number | string;
    height?: number | string;
    className?: string;
};

export default function SystemErrorRive({
    showError,
    width = '100%',
    height = 150,
    className,
}: SystemErrorRiveProps) {
    const { RiveComponent, rive } = useRive({
        src: '/riv/error_icon.riv', // file Rive bạn đã tạo
        stateMachines: 'ErrorStateMachine', // state machine trong file .riv
        autoplay: true,
    });

    // State machine input: bật animation lỗi
    const isError = useStateMachineInput(rive, 'ErrorStateMachine', 'isError', false);

    useEffect(() => {
        if (isError) {
            isError.value = showError; // khi showError=true → animation lỗi chạy
        }
    }, [showError, isError]);

    return (
        <div
            className={className}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <RiveComponent style={{ width: '100%', height: '100%' }} />
        </div>
    );
}
