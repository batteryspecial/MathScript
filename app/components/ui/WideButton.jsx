export default function WideButton({ fcn, textColor, borderStyle, borderColor, hoverColor, text }) {
    return (
        <>
            <button
                onClick={fcn}
                className={`mt-4 w-full py-2 border 
                    ${textColor || ''}
                    ${borderStyle || ''} 
                    ${borderColor || 'border-transparent'}
                    ${hoverColor ? ('hover:border-'+hoverColor+' hover:text-'+hoverColor) : ''}
                    rounded-lg transition-colors text-sm cursor-pointer
                `}
            >
                {text}
            </button>
        </>
    )
}
