import React, { useState } from 'react';
import { Button } from '../atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '../atoms/card';
import { Badge } from '../atoms/badge';
import { TextArea } from '../atoms/text-area';
import { Input } from '../atoms/input';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { useBrowserContext } from '../contexts/browser/BrowserContext';

export interface DocumentInputProps {
  className?: string;
}

export const DocumentInput: React.FC<DocumentInputProps> = ({
  className = '',
}) => {
  const { documents, addDocument, removeDocument } = useBrowserContext();
  const [isAdding, setIsAdding] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocContent, setNewDocContent] = useState('');

  const handleAddDocument = () => {
    if (!newDocName.trim() || !newDocContent.trim()) return;

    addDocument(newDocName.trim(), newDocContent.trim());
    setNewDocName('');
    setNewDocContent('');
    setIsAdding(false);
  };

  const handleCancel = () => {
    setNewDocName('');
    setNewDocContent('');
    setIsAdding(false);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Documents</CardTitle>
            <Badge variant="outline" className="text-xs">
              {documents.length} saved
            </Badge>
          </div>
          <Button
            onClick={() => setIsAdding(true)}
            size="sm"
            variant="outline"
            disabled={isAdding}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Document
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new document form */}
        {isAdding && (
          <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
            <Input
              placeholder="Document name (e.g., 'My Resume')"
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              className="w-full"
            />
            <TextArea
              placeholder="Paste your resume or document content here..."
              value={newDocContent}
              onChange={setNewDocContent}
              rows={8}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddDocument}
                size="sm"
                disabled={!newDocName.trim() || !newDocContent.trim()}
              >
                Save Document
              </Button>
              <Button onClick={handleCancel} size="sm" variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Existing documents list */}
        {documents.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No documents added yet</p>
            <p className="text-sm">
              Add a resume or document to enable AI form filling
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <h3 className="font-medium text-sm truncate">
                        {doc.name}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Added {doc.createdAt.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {doc.content.length} characters
                    </p>
                  </div>
                  <Button
                    onClick={() => removeDocument(doc.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {documents.length > 0 && (
          <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
            💡 Tip: Use the AI Generate button on form fields to automatically
            fill them with information from your documents.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
