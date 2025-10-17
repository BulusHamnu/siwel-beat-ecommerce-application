type template = (userName: string, code?: string | number) => string;

interface emailTemplate {
  emailVerificationTemplate: template;
}

const Template: emailTemplate = {
  emailVerificationTemplate: (userName, code = "") => {
    return `
      <div>
        <h2>Hi, ${userName}</h2>
        <p>Please verify your email address</p>
        <p>Code: ${code} <p>
      </div>
    `;
  },
};

export default Template;
