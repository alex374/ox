import React from 'react';
import { DesignCard } from '../types';
import { Calendar, Eye } from 'lucide-react';

interface DesignCardProps {
  designCard: DesignCard;
  onClick?: () => void;
}

const DesignCardComponent: React.FC<DesignCardProps> = ({ designCard, onClick }) => {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
        <img 
          src={designCard.imageUrl} 
          alt={designCard.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/400x300?text=Design+Preview';
          }}
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
          {designCard.title}
        </h3>
        
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
          {designCard.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{designCard.createdAt.toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-1 text-blue-500 hover:text-blue-600">
            <Eye size={12} />
            <span>查看</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignCardComponent;