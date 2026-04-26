export default function FileMenu({ options }) {
    return (
        <ul className='absolute left-0 top-full z-50 min-w-50 bg-white border border-[#ccc] shadow-md'>
            {options.map((opt, i) => opt.divider ? (
                <hr key={i} className="my-1 border-[#e5e5e5]" />
            ) : (
                <li key={i}>
                    <a
                        href={opt?.link}
                        target='_blank'
                        rel="noopener noreferrer"
                        className="block px-5 text-sm hover:bg-[#f5f5f5] text-[#333]"
                    >
                        {opt.label}
                    </a>
                </li>
            ))}
        </ul>
    )
}
