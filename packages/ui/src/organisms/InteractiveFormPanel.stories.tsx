import type { Meta, StoryObj } from '@storybook/react';
import { InteractiveFormPanel } from './InteractiveFormPanel';
import { BrowserProvider } from '../contexts/browser/BrowserContext';
import type { FormField } from '../types/form';

const meta = {
  title: 'Organisms/InteractiveFormPanel',
  component: InteractiveFormPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The main form interaction component used in the Electron app. Features collapsible sections, inline editing with blue borders, real-time validation, keyboard navigation (Tab/Shift+Tab/Enter/Esc), and synchronization status indicators.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <BrowserProvider>
        <div
          style={{
            height: '100vh',
            padding: '20px',
            backgroundColor: '#f5f5f5',
          }}
        >
          <Story />
        </div>
      </BrowserProvider>
    ),
  ],
} satisfies Meta<typeof InteractiveFormPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample form data matching the production UI
const loginForm: FormField[] = [
  {
    id: 'username',
    name: 'username',
    type: 'text',
    inputType: 'text',
    label: 'Username',
    placeholder: 'Enter username',
    required: true,
    section: 'Login Credentials',
  },
  {
    id: 'password',
    name: 'password',
    type: 'password',
    inputType: 'password',
    label: 'Password',
    placeholder: 'Enter password',
    required: true,
    section: 'Login Credentials',
  },
  {
    id: 'remember',
    name: 'remember',
    type: 'checkbox',
    inputType: 'checkbox',
    label: 'Remember me',
    required: false,
    section: 'Preferences',
  },
];

const registrationForm: FormField[] = [
  // Personal Information
  {
    id: 'firstName',
    name: 'firstName',
    type: 'text',
    inputType: 'text',
    label: 'First Name',
    placeholder: 'John',
    required: true,
    section: 'Personal Information',
  },
  {
    id: 'lastName',
    name: 'lastName',
    type: 'text',
    inputType: 'text',
    label: 'Last Name',
    placeholder: 'Doe',
    required: true,
    section: 'Personal Information',
  },
  {
    id: 'email',
    name: 'email',
    type: 'email',
    inputType: 'email',
    label: 'Email Address',
    placeholder: 'john.doe@example.com',
    required: true,
    pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
    section: 'Personal Information',
  },
  {
    id: 'phone',
    name: 'phone',
    type: 'tel',
    inputType: 'tel',
    label: 'Phone Number',
    placeholder: '+1 (555) 123-4567',
    required: false,
    pattern: '^\\+?1?\\s*\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$',
    section: 'Personal Information',
  },
  {
    id: 'birthdate',
    name: 'birthdate',
    type: 'date',
    inputType: 'date',
    label: 'Date of Birth',
    required: true,
    section: 'Personal Information',
  },

  // Account Setup
  {
    id: 'username',
    name: 'username',
    type: 'text',
    inputType: 'text',
    label: 'Username',
    placeholder: 'johndoe123',
    required: true,
    minLength: 3,
    maxLength: 20,
    section: 'Account Setup',
  },
  {
    id: 'password',
    name: 'password',
    type: 'password',
    inputType: 'password',
    label: 'Password',
    placeholder: 'Enter a strong password',
    required: true,
    minLength: 8,
    section: 'Account Setup',
  },
  {
    id: 'confirmPassword',
    name: 'confirmPassword',
    type: 'password',
    inputType: 'password',
    label: 'Confirm Password',
    placeholder: 'Re-enter your password',
    required: true,
    section: 'Account Setup',
  },

  // Preferences
  {
    id: 'newsletter',
    name: 'newsletter',
    type: 'checkbox',
    inputType: 'checkbox',
    label: 'Subscribe to newsletter',
    required: false,
    section: 'Preferences',
  },
  {
    id: 'notifications',
    name: 'notifications',
    type: 'checkbox',
    inputType: 'checkbox',
    label: 'Enable email notifications',
    required: false,
    section: 'Preferences',
  },
  {
    id: 'language',
    name: 'language',
    type: 'select',
    inputType: 'select',
    label: 'Preferred Language',
    options: ['English', 'Spanish', 'French', 'German', 'Chinese'],
    required: false,
    section: 'Preferences',
  },
];

const jobApplicationForm: FormField[] = [
  // Personal Details
  {
    id: 'title',
    name: 'title',
    type: 'select',
    inputType: 'select',
    label: 'Title',
    options: ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.'],
    required: false,
    section: 'Personal Details',
  },
  {
    id: 'firstName',
    name: 'firstName',
    type: 'text',
    inputType: 'text',
    label: 'First Name',
    placeholder: 'Enter your first name',
    required: true,
    section: 'Personal Details',
  },
  {
    id: 'middleName',
    name: 'middleName',
    type: 'text',
    inputType: 'text',
    label: 'Middle Name',
    placeholder: 'Enter your middle name',
    required: false,
    section: 'Personal Details',
  },
  {
    id: 'lastName',
    name: 'lastName',
    type: 'text',
    inputType: 'text',
    label: 'Last Name',
    placeholder: 'Enter your last name',
    required: true,
    section: 'Personal Details',
  },
  {
    id: 'email',
    name: 'email',
    type: 'email',
    inputType: 'email',
    label: 'Email Address',
    placeholder: 'your.email@example.com',
    required: true,
    section: 'Personal Details',
  },
  {
    id: 'phone',
    name: 'phone',
    type: 'tel',
    inputType: 'tel',
    label: 'Phone Number',
    placeholder: '+1 (555) 123-4567',
    required: true,
    section: 'Personal Details',
  },

  // Address
  {
    id: 'address',
    name: 'address',
    type: 'text',
    inputType: 'text',
    label: 'Street Address',
    placeholder: '123 Main Street',
    required: true,
    section: 'Address',
  },
  {
    id: 'city',
    name: 'city',
    type: 'text',
    inputType: 'text',
    label: 'City',
    placeholder: 'New York',
    required: true,
    section: 'Address',
  },
  {
    id: 'state',
    name: 'state',
    type: 'select',
    inputType: 'select',
    label: 'State',
    options: ['NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA'],
    required: true,
    section: 'Address',
  },
  {
    id: 'zipcode',
    name: 'zipcode',
    type: 'text',
    inputType: 'text',
    label: 'ZIP Code',
    placeholder: '10001',
    pattern: '[0-9]{5}',
    required: true,
    section: 'Address',
  },
  {
    id: 'country',
    name: 'country',
    type: 'select',
    inputType: 'select',
    label: 'Country',
    options: ['United States', 'Canada', 'Mexico', 'United Kingdom'],
    required: true,
    section: 'Address',
  },

  // Professional Information
  {
    id: 'position',
    name: 'position',
    type: 'text',
    inputType: 'text',
    label: 'Position Applied For',
    placeholder: 'Software Engineer',
    required: true,
    section: 'Professional Information',
  },
  {
    id: 'experience',
    name: 'experience',
    type: 'select',
    inputType: 'select',
    label: 'Years of Experience',
    options: ['0-1 years', '2-3 years', '4-5 years', '6-10 years', '10+ years'],
    required: true,
    section: 'Professional Information',
  },
  {
    id: 'education',
    name: 'education',
    type: 'select',
    inputType: 'select',
    label: 'Highest Education',
    options: ['High School', "Bachelor's", "Master's", 'PhD', 'Other'],
    required: true,
    section: 'Professional Information',
  },
  {
    id: 'resume',
    name: 'resume',
    type: 'file',
    inputType: 'text',
    label: 'Resume Upload',
    placeholder: 'Upload your resume',
    required: true,
    section: 'Professional Information',
  },
  {
    id: 'coverLetter',
    name: 'coverLetter',
    type: 'file',
    inputType: 'text',
    label: 'Cover Letter',
    placeholder: 'Upload cover letter (optional)',
    required: false,
    section: 'Professional Information',
  },
  {
    id: 'portfolio',
    name: 'portfolio',
    type: 'url',
    inputType: 'url',
    label: 'Portfolio URL',
    placeholder: 'https://yourportfolio.com',
    required: false,
    section: 'Professional Information',
  },
  {
    id: 'linkedin',
    name: 'linkedin',
    type: 'url',
    inputType: 'url',
    label: 'LinkedIn Profile',
    placeholder: 'https://linkedin.com/in/yourprofile',
    required: false,
    section: 'Professional Information',
  },

  // Additional Information
  {
    id: 'salary',
    name: 'salary',
    type: 'number',
    inputType: 'number',
    label: 'Expected Salary',
    placeholder: '75000',
    min: '0',
    required: false,
    section: 'Additional Information',
  },
  {
    id: 'startDate',
    name: 'startDate',
    type: 'date',
    inputType: 'date',
    label: 'Available Start Date',
    required: true,
    section: 'Additional Information',
  },
  {
    id: 'relocation',
    name: 'relocation',
    type: 'checkbox',
    inputType: 'checkbox',
    label: 'Willing to relocate',
    required: false,
    section: 'Additional Information',
  },
  {
    id: 'remote',
    name: 'remote',
    type: 'checkbox',
    inputType: 'checkbox',
    label: 'Interested in remote work',
    required: false,
    section: 'Additional Information',
  },
  {
    id: 'comments',
    name: 'comments',
    type: 'textarea',
    inputType: 'textarea',
    label: 'Additional Comments',
    placeholder: 'Any additional information you would like to share...',
    required: false,
    maxLength: 500,
    section: 'Additional Information',
  },
];

const contactForm: FormField[] = [
  {
    id: 'name',
    name: 'name',
    type: 'text',
    inputType: 'text',
    label: 'Full Name',
    placeholder: 'Your Name',
    required: true,
    section: 'Contact Information',
  },
  {
    id: 'email',
    name: 'email',
    type: 'email',
    inputType: 'email',
    label: 'Email Address',
    placeholder: 'your.email@example.com',
    required: true,
    section: 'Contact Information',
  },
  {
    id: 'subject',
    name: 'subject',
    type: 'text',
    inputType: 'text',
    label: 'Subject',
    placeholder: 'What is this about?',
    required: true,
    section: 'Message Details',
  },
  {
    id: 'message',
    name: 'message',
    type: 'textarea',
    inputType: 'textarea',
    label: 'Message',
    placeholder: 'Type your message here...',
    required: true,
    minLength: 10,
    maxLength: 1000,
    section: 'Message Details',
  },
  {
    id: 'urgency',
    name: 'urgency',
    type: 'select',
    inputType: 'select',
    label: 'Priority',
    options: ['Low', 'Medium', 'High', 'Urgent'],
    required: false,
    section: 'Message Details',
  },
];

// Default story shows the typical registration form UI
export const Default: Story = {
  args: {
    forms: [{ fields: registrationForm }],
  },
};

// Story showing the empty state when no forms are detected
export const NoForms: Story = {
  args: {
    forms: [],
  },
};

// Simple login form showing minimal fields
export const SimpleLoginForm: Story = {
  args: {
    forms: [{ fields: loginForm }],
  },
};

// Story showing the production-like form with 10 fields as seen in the Electron app
export const ProductionExample: Story = {
  args: {
    forms: [
      {
        fields: [
          {
            id: 'firstName',
            name: 'firstName',
            type: 'text',
            inputType: 'text',
            label: 'First Name',
            placeholder: 'John',
            required: true,
            section: 'Fields',
          },
          {
            id: 'lastName',
            name: 'lastName',
            type: 'text',
            inputType: 'text',
            label: 'Last Name',
            placeholder: 'Doe',
            required: true,
            section: 'Fields',
          },
          {
            id: 'email',
            name: 'email',
            type: 'email',
            inputType: 'email',
            label: 'Email',
            placeholder: 'john.doe@example.com',
            required: true,
            section: 'Fields',
          },
          {
            id: 'phone',
            name: 'phone',
            type: 'tel',
            inputType: 'tel',
            label: 'Phone',
            placeholder: '(555) 123-4567',
            required: false,
            section: 'Fields',
          },
          {
            id: 'address',
            name: 'address',
            type: 'text',
            inputType: 'text',
            label: 'Address',
            placeholder: '123 Main St',
            required: true,
            section: 'Fields',
          },
          {
            id: 'city',
            name: 'city',
            type: 'text',
            inputType: 'text',
            label: 'City',
            placeholder: 'New York',
            required: true,
            section: 'Fields',
          },
          {
            id: 'state',
            name: 'state',
            type: 'select',
            inputType: 'select',
            label: 'State',
            options: ['NY', 'CA', 'TX', 'FL', 'IL'],
            required: true,
            section: 'Fields',
          },
          {
            id: 'zipCode',
            name: 'zipCode',
            type: 'text',
            inputType: 'text',
            label: 'ZIP Code',
            placeholder: '10001',
            required: true,
            section: 'Fields',
          },
          {
            id: 'country',
            name: 'country',
            type: 'select',
            inputType: 'select',
            label: 'Country',
            options: ['United States', 'Canada', 'Mexico'],
            required: true,
            section: 'Fields',
          },
          {
            id: 'newsletter',
            name: 'newsletter',
            type: 'checkbox',
            inputType: 'checkbox',
            label: 'Subscribe to newsletter',
            required: false,
            section: 'Fields',
          },
        ],
      },
    ],
  },
};

export const ContactForm: Story = {
  args: {
    forms: [{ fields: contactForm }],
  },
};

export const ComplexJobApplication: Story = {
  args: {
    forms: [{ fields: jobApplicationForm }],
  },
};

export const MultipleForms: Story = {
  args: {
    forms: [{ fields: loginForm }, { fields: contactForm }],
  },
};

export const MixedFieldTypes: Story = {
  args: {
    forms: [
      {
        fields: [
          // Text inputs
          {
            id: 'text',
            name: 'text',
            type: 'text',
            inputType: 'text',
            label: 'Text Input',
            placeholder: 'Enter text',
            required: true,
            section: 'Text Inputs',
          },
          {
            id: 'email',
            name: 'email',
            type: 'email',
            inputType: 'email',
            label: 'Email Input',
            placeholder: 'user@example.com',
            required: true,
            section: 'Text Inputs',
          },
          {
            id: 'password',
            name: 'password',
            type: 'password',
            inputType: 'password',
            label: 'Password Input',
            placeholder: 'Enter password',
            required: true,
            section: 'Text Inputs',
          },
          {
            id: 'tel',
            name: 'tel',
            type: 'tel',
            inputType: 'tel',
            label: 'Phone Input',
            placeholder: '+1 (555) 123-4567',
            required: false,
            section: 'Text Inputs',
          },
          {
            id: 'url',
            name: 'url',
            type: 'url',
            inputType: 'url',
            label: 'URL Input',
            placeholder: 'https://example.com',
            required: false,
            section: 'Text Inputs',
          },
          {
            id: 'search',
            name: 'search',
            type: 'search',
            inputType: 'search',
            label: 'Search Input',
            placeholder: 'Search...',
            required: false,
            section: 'Text Inputs',
          },

          // Number and Date
          {
            id: 'number',
            name: 'number',
            type: 'number',
            inputType: 'number',
            label: 'Number Input',
            placeholder: '100',
            min: '0',
            max: '1000',
            step: '10',
            required: false,
            section: 'Numbers & Dates',
          },
          {
            id: 'range',
            name: 'range',
            type: 'range',
            inputType: 'range',
            label: 'Range Slider',
            min: '0',
            max: '100',
            step: '5',
            required: false,
            section: 'Numbers & Dates',
          },
          {
            id: 'date',
            name: 'date',
            type: 'date',
            inputType: 'date',
            label: 'Date Input',
            required: false,
            section: 'Numbers & Dates',
          },

          // Selections
          {
            id: 'select',
            name: 'select',
            type: 'select',
            inputType: 'select',
            label: 'Select Dropdown',
            options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            required: true,
            section: 'Selections',
          },
          {
            id: 'multiselect',
            name: 'multiselect',
            type: 'select',
            inputType: 'select',
            label: 'Multi-Select',
            options: ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
            multiple: true,
            required: false,
            section: 'Selections',
          },
          {
            id: 'radio',
            name: 'radio',
            type: 'radio',
            inputType: 'radio',
            label: 'Radio Buttons',
            options: ['Yes', 'No', 'Maybe'],
            required: true,
            section: 'Selections',
          },
          {
            id: 'checkbox',
            name: 'checkbox',
            type: 'checkbox',
            inputType: 'checkbox',
            label: 'Checkbox Option',
            required: false,
            section: 'Selections',
          },

          // Text Areas
          {
            id: 'textarea',
            name: 'textarea',
            type: 'textarea',
            inputType: 'textarea',
            label: 'Textarea',
            placeholder: 'Enter long text...',
            required: false,
            minLength: 10,
            maxLength: 500,
            section: 'Long Text',
          },

          // Color
          {
            id: 'color',
            name: 'color',
            type: 'color',
            inputType: 'color',
            label: 'Color Picker',
            required: false,
            section: 'Other',
          },
        ],
      },
    ],
  },
};

export const WithValidation: Story = {
  args: {
    forms: [
      {
        fields: [
          {
            id: 'email',
            name: 'email',
            type: 'email',
            inputType: 'email',
            label: 'Email (with pattern validation)',
            placeholder: 'user@example.com',
            required: true,
            pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
            section: 'Validation Examples',
          },
          {
            id: 'phone',
            name: 'phone',
            type: 'tel',
            inputType: 'tel',
            label: 'Phone (US format)',
            placeholder: '(555) 123-4567',
            required: true,
            pattern: '^\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$',
            section: 'Validation Examples',
          },
          {
            id: 'username',
            name: 'username',
            type: 'text',
            inputType: 'text',
            label: 'Username (3-20 chars, alphanumeric)',
            placeholder: 'johndoe123',
            required: true,
            minLength: 3,
            maxLength: 20,
            pattern: '^[a-zA-Z0-9_]+$',
            section: 'Validation Examples',
          },
          {
            id: 'age',
            name: 'age',
            type: 'number',
            inputType: 'number',
            label: 'Age (18-120)',
            placeholder: '25',
            required: true,
            min: '18',
            max: '120',
            section: 'Validation Examples',
          },
          {
            id: 'website',
            name: 'website',
            type: 'url',
            inputType: 'url',
            label: 'Website (must start with https)',
            placeholder: 'https://example.com',
            required: false,
            pattern: '^https://.*',
            section: 'Validation Examples',
          },
          {
            id: 'zipcode',
            name: 'zipcode',
            type: 'text',
            inputType: 'text',
            label: 'ZIP Code (5 digits)',
            placeholder: '10001',
            required: true,
            pattern: '^[0-9]{5}$',
            minLength: 5,
            maxLength: 5,
            section: 'Validation Examples',
          },
          {
            id: 'bio',
            name: 'bio',
            type: 'textarea',
            inputType: 'textarea',
            label: 'Bio (10-200 characters)',
            placeholder: 'Tell us about yourself...',
            required: true,
            minLength: 10,
            maxLength: 200,
            section: 'Validation Examples',
          },
        ],
      },
    ],
  },
};
