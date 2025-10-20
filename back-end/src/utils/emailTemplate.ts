type template = (userName: string, code?: string | number) => string;

interface emailTemplate {
  emailVerificationTemplate: template;
  resetPasswordTemplate: template;
  resetSuccessfulTemplate: template;
}

const Template: emailTemplate = {
  emailVerificationTemplate: (userName, code = "") => {
    return `
      <div>
        <h2>Hi, ${userName}</h2>
        <p>Please verify your email address</p>
        <p>Code: ${code} <p>
        <P><small>The code will expire in 15 min.</P></small>
      </div>
    `;
  },
  resetPasswordTemplate: (userName, code = "") => {
    return `
      <div>
        <h2>Hi, ${userName}</h2>
        <p>Have you request to reset your password use the code below to reset your password</p>
        <p>Code: ${code} <p>
        <P><small>The code will expire in 15 min.</P></small>
      </div>
    `;
  },
  resetSuccessfulTemplate: (userName) => {
    return `
      <div>
        <h2>Hi, ${userName}</h2>
        <p>Your password have been reset successful, you can login now.</p>
      </div>
    `;
  },
};

export default Template;
