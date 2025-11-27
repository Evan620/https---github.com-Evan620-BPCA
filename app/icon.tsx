import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 24,
                    background: 'transparent',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'black',
                }}
            >
                {/* Simple blueprint icon representation */}
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M8 24V12L16 6L24 12V24"
                        stroke="black"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <circle cx="24" cy="24" r="5" fill="#F59E0B" stroke="none" />
                </svg>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    )
}
