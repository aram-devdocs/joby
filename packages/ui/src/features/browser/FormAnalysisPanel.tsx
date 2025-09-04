import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  ScrollArea,
  Separator,
} from '../../atoms';
import {
  FileText,
  User,
  Mail,
  Briefcase,
  GraduationCap,
  Paperclip,
  Hash,
} from 'lucide-react';

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

export const FormAnalysisPanel: React.FC<FormAnalysisPanelProps> = ({
  forms,
}) => {
  const getFieldIcon = (field: FormField) => {
    const text =
      `${field.name || ''} ${field.id || ''} ${field.placeholder || ''}`.toLowerCase();

    if (
      text.includes('name') ||
      text.includes('first') ||
      text.includes('last')
    ) {
      return <User className="h-4 w-4" />;
    }
    if (text.includes('email')) {
      return <Mail className="h-4 w-4" />;
    }
    if (
      text.includes('experience') ||
      text.includes('work') ||
      text.includes('job')
    ) {
      return <Briefcase className="h-4 w-4" />;
    }
    if (
      text.includes('education') ||
      text.includes('school') ||
      text.includes('degree')
    ) {
      return <GraduationCap className="h-4 w-4" />;
    }
    if (field.type === 'file') {
      return <Paperclip className="h-4 w-4" />;
    }
    return <Hash className="h-4 w-4" />;
  };

  const getFieldCategory = (field: FormField): string => {
    const text =
      `${field.name || ''} ${field.id || ''} ${field.placeholder || ''}`.toLowerCase();

    if (
      text.includes('name') ||
      text.includes('first') ||
      text.includes('last')
    ) {
      return 'Personal';
    }
    if (
      text.includes('email') ||
      text.includes('phone') ||
      text.includes('address')
    ) {
      return 'Contact';
    }
    if (
      text.includes('experience') ||
      text.includes('work') ||
      text.includes('job')
    ) {
      return 'Experience';
    }
    if (
      text.includes('education') ||
      text.includes('school') ||
      text.includes('degree')
    ) {
      return 'Education';
    }
    if (field.type === 'file') {
      return 'Documents';
    }
    return 'Other';
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'Personal':
        return 'default';
      case 'Contact':
        return 'secondary';
      case 'Experience':
        return 'info';
      case 'Education':
        return 'success';
      case 'Documents':
        return 'warning';
      default:
        return 'outline';
    }
  };

  if (!forms || forms.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Form Analysis
          </CardTitle>
          <CardDescription>No forms detected on this page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Navigate to a job application page to detect forms</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Form Analysis
        </CardTitle>
        <CardDescription>
          {forms.length} form{forms.length !== 1 ? 's' : ''} detected with{' '}
          {forms.reduce((acc, form) => acc + form.fields.length, 0)} total
          fields
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {forms.map((form, formIndex) => (
            <div key={formIndex} className="mb-6">
              <h3 className="text-sm font-semibold mb-3">
                Form {formIndex + 1} ({form.fields.length} fields)
              </h3>
              <div className="space-y-2">
                {form.fields.map((field, fieldIndex) => {
                  const category = getFieldCategory(field);
                  return (
                    <div
                      key={fieldIndex}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="mt-0.5 text-gray-600">
                        {getFieldIcon(field)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">
                            {field.name ||
                              field.id ||
                              `Field ${fieldIndex + 1}`}
                          </span>
                          <Badge
                            variant={getCategoryBadgeVariant(category)}
                            className="text-xs"
                          >
                            {category}
                          </Badge>
                          {field.required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Type: {field.type}
                          {field.placeholder &&
                            ` • Placeholder: "${field.placeholder}"`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {formIndex < forms.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
