interface InputFormProps {
    name: string;
    type: string;
    placeholder: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export default function InputForm({
    name,
    type,
    placeholder,
    value,
    onChange,
}: InputFormProps) {
    return (
        <div className="grid grid-cols-2 text-nowrap text-amber-700">
            <div>
                <label>{placeholder}*</label>
            </div>
            <div>
                <input
                    className=" border-b mb-5 border-amber-900 ml-35 focus:outline-none"
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
            </div>
        </div>
    );
}
