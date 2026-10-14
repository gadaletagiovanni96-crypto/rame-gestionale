export default function ErrorText({ children }) { return children ? <p className="warn" role="alert">{children}</p> : null; }
