/* Button primary */
function Button({ text, className }: { text: string; className?: string }) {
  return <button className={`button-primary ${className}`}>{text}</button>;
}

export default Button;
