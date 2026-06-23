import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Video, X } from 'lucide-react';
import './TravelTimeline.css';

const TravelTimeline = ({ timelineData }) => {
  const [fullScreenImage, setFullScreenImage] = useState(null);

  if (!timelineData || timelineData.length === 0) {
    return (
      <div className="tab-empty-state">
        <Camera size={48} />
        <h3>No memories available yet</h3>
        <p>Start capturing your journey.</p>
      </div>
    );
  }

  // Calculate total memories
  const totalMemories = timelineData.reduce((acc, group) => acc + group.memories.length, 0);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="travel-timeline-container">
      <div className="timeline-header glass-panel">
        <h2 className="timeline-title">Story Timeline</h2>
        <p className="timeline-subtitle">{totalMemories} {totalMemories === 1 ? 'Memory' : 'Memories'} Captured</p>
      </div>

      <div className="timeline-content">
        {timelineData.map((group, index) => (
          <div key={group._id} className="timeline-day-group">
            <div className="day-marker">
              <div className="day-dot"></div>
              <div className="day-line"></div>
            </div>
            <div className="day-content">
              <div className="day-header">
                <h3>Day {index + 1} - {formatDate(group._id)}</h3>
                <span className="day-memory-count">
                  {group.memories.length} {group.memories.length === 1 ? 'Memory' : 'Memories'}
                </span>
              </div>
              
              <div className="day-memories">
                {group.memories.map((memory) => {
                  const isVideo = memory.mediaType?.toLowerCase().includes('video');
                  
                  return (
                    <div key={memory._id} className="memory-timeline-card glass-panel">
                      <div className="memory-media-container">
                        {isVideo ? (
                          <video src={memory.mediaUrl} controls className="memory-media-preview" />
                        ) : (
                          <img 
                            src={memory.mediaUrl} 
                            alt={memory.caption || 'Memory'} 
                            className="memory-media-preview clickable"
                            onClick={() => setFullScreenImage(memory.mediaUrl)}
                          />
                        )}
                        <div className="media-type-badge">
                          {isVideo ? <Video size={14} /> : <ImageIcon size={14} />}
                        </div>
                      </div>
                      <div className="memory-details">
                        <div className="memory-caption">
                          {memory.caption ? memory.caption : <span className="no-caption">No caption provided</span>}
                        </div>
                        {memory.travelNote && memory.travelNote.trim() !== '' && (
                          <div className="memory-note">
                            {memory.travelNote}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Screen Image Modal */}
      {fullScreenImage && (
        <div className="fullscreen-overlay" onClick={() => setFullScreenImage(null)}>
          <button className="close-fullscreen-btn" onClick={() => setFullScreenImage(null)}>
            <X size={24} />
          </button>
          <img src={fullScreenImage} alt="Full screen preview" className="fullscreen-image" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default TravelTimeline;
