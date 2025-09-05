import React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';
import type { JSONFormatterProps } from '../types/terminal';

interface JSONNode {
  key?: string | number;
  value: unknown;
  type:
    | 'object'
    | 'array'
    | 'string'
    | 'number'
    | 'boolean'
    | 'null'
    | 'undefined';
  depth: number;
}

const getValueType = (value: unknown): JSONNode['type'] => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  return typeof value as JSONNode['type'];
};

const formatPrimitive = (value: unknown, type: JSONNode['type']): string => {
  switch (type) {
    case 'string':
      return `"${String(value)}"`;
    case 'null':
      return 'null';
    case 'undefined':
      return 'undefined';
    case 'boolean':
    case 'number':
      return String(value);
    default:
      return String(value);
  }
};

interface JSONNodeProps {
  node: JSONNode;
  maxDepth: number;
  theme: 'dark' | 'light';
  isLast?: boolean;
}

const JSONNodeComponent: React.FC<JSONNodeProps> = ({
  node,
  maxDepth,
  theme,
  isLast = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(
    node.depth < Math.min(maxDepth, 2),
  );

  const shouldCollapse = node.depth >= maxDepth;
  const isContainer = node.type === 'object' || node.type === 'array';

  const getColorClass = (type: string) => {
    const colors = {
      dark: {
        key: 'text-blue-300',
        string: 'text-green-300',
        number: 'text-purple-300',
        boolean: 'text-yellow-300',
        null: 'text-red-300',
        undefined: 'text-red-300',
        bracket: 'text-gray-400',
      },
      light: {
        key: 'text-blue-600',
        string: 'text-green-600',
        number: 'text-purple-600',
        boolean: 'text-amber-600',
        null: 'text-red-600',
        undefined: 'text-red-600',
        bracket: 'text-gray-600',
      },
    };
    return (
      colors[theme][type as keyof (typeof colors)[typeof theme]] ||
      'text-current'
    );
  };

  if (!isContainer) {
    return (
      <div className="flex items-start gap-1">
        {node.key !== undefined && (
          <>
            <span className={cn('font-medium', getColorClass('key'))}>
              {typeof node.key === 'string' ? `"${node.key}"` : node.key}
            </span>
            <span className={getColorClass('bracket')}>:</span>
          </>
        )}
        <span className={getColorClass(node.type)}>
          {formatPrimitive(node.value, node.type)}
        </span>
        {!isLast && <span className={getColorClass('bracket')}>,</span>}
      </div>
    );
  }

  const entries =
    node.type === 'array'
      ? (node.value as unknown[]).map((item, index) => ({
          key: index,
          value: item,
        }))
      : Object.entries(node.value as Record<string, unknown>).map(
          ([key, value]) => ({ key, value }),
        );

  const openBracket = node.type === 'array' ? '[' : '{';
  const closeBracket = node.type === 'array' ? ']' : '}';

  if (shouldCollapse || !isExpanded) {
    const preview =
      node.type === 'array'
        ? `Array(${entries.length})`
        : `Object(${entries.length})`;

    return (
      <div className="flex items-center gap-1">
        {node.key !== undefined && (
          <>
            <span className={cn('font-medium', getColorClass('key'))}>
              {typeof node.key === 'string' ? `"${node.key}"` : node.key}
            </span>
            <span className={getColorClass('bracket')}>:</span>
          </>
        )}
        {isContainer && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="text-xs">{isExpanded ? '−' : '+'}</span>
          </Button>
        )}
        <span className={getColorClass('bracket')}>{openBracket}</span>
        <span className="text-xs text-muted-foreground italic">{preview}</span>
        <span className={getColorClass('bracket')}>{closeBracket}</span>
        {!isLast && <span className={getColorClass('bracket')}>,</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1">
        {node.key !== undefined && (
          <>
            <span className={cn('font-medium', getColorClass('key'))}>
              {typeof node.key === 'string' ? `"${node.key}"` : node.key}
            </span>
            <span className={getColorClass('bracket')}>:</span>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 hover:bg-transparent"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="text-xs">−</span>
        </Button>
        <span className={getColorClass('bracket')}>{openBracket}</span>
      </div>
      <div className="ml-4 border-l border-gray-300 dark:border-gray-600 pl-2">
        {entries.map((entry, index) => (
          <JSONNodeComponent
            key={`${entry.key}`}
            node={{
              key: entry.key,
              value: entry.value,
              type: getValueType(entry.value),
              depth: node.depth + 1,
            }}
            maxDepth={maxDepth}
            theme={theme}
            isLast={index === entries.length - 1}
          />
        ))}
      </div>
      <div className="flex items-center gap-1">
        <span className={getColorClass('bracket')}>{closeBracket}</span>
        {!isLast && <span className={getColorClass('bracket')}>,</span>}
      </div>
    </div>
  );
};

export const JSONFormatter = React.forwardRef<
  HTMLDivElement,
  JSONFormatterProps
>(
  (
    {
      data,
      collapsed = false,
      maxDepth = 3,
      theme = 'dark',
      className,
      onToggle,
      ...props
    },
    ref,
  ) => {
    const [isCollapsed, setIsCollapsed] = React.useState(collapsed);

    React.useEffect(() => {
      setIsCollapsed(collapsed);
    }, [collapsed]);

    const handleToggle = () => {
      const newCollapsed = !isCollapsed;
      setIsCollapsed(newCollapsed);
      onToggle?.(newCollapsed);
    };

    const rootNode: JSONNode = {
      value: data,
      type: getValueType(data),
      depth: 0,
    };

    if (isCollapsed) {
      const preview =
        rootNode.type === 'array'
          ? `Array(${(data as unknown[]).length})`
          : rootNode.type === 'object' && data !== null
            ? `Object(${Object.keys(data as Record<string, unknown>).length})`
            : formatPrimitive(data, rootNode.type);

      return (
        <div
          ref={ref}
          className={cn(
            'font-mono text-sm rounded border p-2',
            theme === 'dark'
              ? 'bg-gray-900 border-gray-700 text-gray-100'
              : 'bg-gray-50 border-gray-200 text-gray-900',
            className,
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 hover:bg-transparent"
              onClick={handleToggle}
            >
              <span className="text-xs">+</span>
            </Button>
            <span className="text-xs text-muted-foreground italic">
              {preview}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'font-mono text-sm rounded border p-2',
          theme === 'dark'
            ? 'bg-gray-900 border-gray-700 text-gray-100'
            : 'bg-gray-50 border-gray-200 text-gray-900',
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 hover:bg-transparent"
            onClick={handleToggle}
          >
            <span className="text-xs">−</span>
          </Button>
          <span className="text-xs text-muted-foreground">JSON</span>
        </div>
        <JSONNodeComponent
          node={rootNode}
          maxDepth={maxDepth}
          theme={theme}
          isLast={true}
        />
      </div>
    );
  },
);

JSONFormatter.displayName = 'JSONFormatter';
