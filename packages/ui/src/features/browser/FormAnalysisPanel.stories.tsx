import type { Meta, StoryObj } from "@storybook/react";

// Mock the FormAnalysisPanel to avoid context issues
// The real component is in ./FormAnalysisPanel but requires BrowserContext
interface FormField {
  name?: string;
  type: string;
  id?: string;
  placeholder?: string;
  required?: boolean;
}

interface FormData {
  fields: FormField[];
}

interface FormAnalysisPanelProps {
  forms: FormData[];
}

// Import the actual component
import { FormAnalysisPanel } from "./FormAnalysisPanel";

const meta = {
  title: "Features/Browser/FormAnalysisPanel",
  component: FormAnalysisPanel,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FormAnalysisPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockJobApplicationForm = {
  fields: [
    {
      name: "firstName",
      type: "text",
      id: "first-name",
      placeholder: "First Name",
      required: true,
    },
    {
      name: "lastName",
      type: "text",
      id: "last-name",
      placeholder: "Last Name",
      required: true,
    },
    {
      name: "email",
      type: "email",
      id: "email",
      placeholder: "your.email@example.com",
      required: true,
    },
    { name: "phone", type: "tel", id: "phone", placeholder: "Phone Number" },
    { name: "resume", type: "file", id: "resume-upload", required: true },
    { name: "coverLetter", type: "file", id: "cover-letter" },
    {
      name: "position",
      type: "text",
      id: "position",
      placeholder: "Position Applied For",
      required: true,
    },
    { name: "experience", type: "select", id: "years-experience" },
    {
      name: "education",
      type: "select",
      id: "education-level",
      required: true,
    },
    { name: "startDate", type: "date", id: "available-start" },
    {
      name: "salary",
      type: "number",
      id: "salary-expectation",
      placeholder: "Expected Salary",
    },
    {
      name: "comments",
      type: "textarea",
      id: "additional-comments",
      placeholder: "Additional Comments",
    },
  ],
};

const mockContactForm = {
  fields: [
    {
      name: "name",
      type: "text",
      id: "full-name",
      placeholder: "Your Name",
      required: true,
    },
    {
      name: "email",
      type: "email",
      id: "contact-email",
      placeholder: "Email Address",
      required: true,
    },
    {
      name: "subject",
      type: "text",
      id: "message-subject",
      placeholder: "Subject",
    },
    {
      name: "message",
      type: "textarea",
      id: "message-body",
      placeholder: "Your Message",
      required: true,
    },
  ],
};

const mockLoginForm = {
  fields: [
    {
      name: "username",
      type: "text",
      id: "username",
      placeholder: "Username or Email",
      required: true,
    },
    {
      name: "password",
      type: "password",
      id: "password",
      placeholder: "Password",
      required: true,
    },
    { name: "remember", type: "checkbox", id: "remember-me" },
  ],
};

export const SingleForm: Story = {
  args: {
    forms: [mockJobApplicationForm],
  },
};

export const MultipleForms: Story = {
  args: {
    forms: [mockJobApplicationForm, mockContactForm, mockLoginForm],
  },
};

export const NoForms: Story = {
  args: {
    forms: [],
  },
};

export const SimpleContactForm: Story = {
  args: {
    forms: [mockContactForm],
  },
};

export const ComplexApplicationForm: Story = {
  args: {
    forms: [
      {
        fields: [
          // Personal Information Section
          {
            name: "firstName",
            type: "text",
            id: "first-name",
            placeholder: "First Name",
            required: true,
          },
          {
            name: "middleName",
            type: "text",
            id: "middle-name",
            placeholder: "Middle Name",
          },
          {
            name: "lastName",
            type: "text",
            id: "last-name",
            placeholder: "Last Name",
            required: true,
          },
          {
            name: "email",
            type: "email",
            id: "email",
            placeholder: "Email",
            required: true,
          },
          {
            name: "phone",
            type: "tel",
            id: "phone",
            placeholder: "Phone",
            required: true,
          },
          {
            name: "address",
            type: "text",
            id: "address",
            placeholder: "Street Address",
          },
          { name: "city", type: "text", id: "city", placeholder: "City" },
          { name: "state", type: "select", id: "state" },
          { name: "zip", type: "text", id: "zip", placeholder: "ZIP Code" },

          // Professional Information
          { name: "resume", type: "file", id: "resume", required: true },
          { name: "coverLetter", type: "file", id: "cover-letter" },
          {
            name: "portfolio",
            type: "url",
            id: "portfolio",
            placeholder: "Portfolio URL",
          },
          {
            name: "linkedin",
            type: "url",
            id: "linkedin",
            placeholder: "LinkedIn Profile",
          },

          // Experience and Education
          {
            name: "experience",
            type: "select",
            id: "experience",
            required: true,
          },
          {
            name: "education",
            type: "select",
            id: "education",
            required: true,
          },
          {
            name: "skills",
            type: "textarea",
            id: "skills",
            placeholder: "Skills and Qualifications",
          },

          // Additional Information
          {
            name: "references",
            type: "textarea",
            id: "references",
            placeholder: "References",
          },
          { name: "availability", type: "date", id: "start-date" },
          {
            name: "salary",
            type: "number",
            id: "salary",
            placeholder: "Expected Salary",
          },
        ],
      },
    ],
  },
};
