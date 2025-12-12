import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { getImpactColor, getScoreColor } from '@/lib/utils';

interface ImpactCardProps {
  title: string;
  score: number;
  type: 'positive' | 'negative' | 'neutral';
  reasoning: string;
  confidence?: number;
  additionalInfo?: React.ReactNode;
}

export function ImpactCard({
  title,
  score,
  type,
  reasoning,
  confidence,
  additionalInfo,
}: ImpactCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'positive':
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getBadgeVariant = () => {
    switch (type) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={getBadgeVariant()}>
            {type === 'positive' ? '利好' : type === 'negative' ? '利空' : '中性'}
          </Badge>
          {confidence !== undefined && (
            <Badge variant="outline">
              置信度: {(confidence * 100).toFixed(0)}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 leading-relaxed">{reasoning}</p>
        {additionalInfo && <div className="mt-3">{additionalInfo}</div>}
      </CardContent>
    </Card>
  );
}
