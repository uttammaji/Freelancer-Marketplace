import React, { useState } from 'react';
import { ExternalLink, Eye, Image } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

export function PortfolioCard({ item }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsPreviewOpen(true)}
        className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-soft-lg cursor-pointer transition-all duration-200 flex flex-col justify-between"
      >
        {/* Thumbnail Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg backdrop-blur-md">
              <Eye className="w-3.5 h-3.5" /> View Project
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <Badge variant="primary" size="sm" className="mb-2">
              {item.category}
            </Badge>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {item.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Tech pills */}
          {item.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {item.technologies.slice(0, 3).map((tech, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Detail Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={item.title}
        subtitle={item.category}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {item.description}
          </p>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Technologies Used</h5>
            <div className="flex flex-wrap gap-1.5">
              {item.technologies?.map((tech, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {item.link && (
            <div className="pt-2">
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                <span>Visit Live Demo / Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
