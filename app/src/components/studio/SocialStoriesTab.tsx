import { SocialStoryViewer } from '../SocialStoryViewer';
import type { SocialStory } from '../../data/social-stories';

export interface SocialStoriesTabProps {
  stories: SocialStory[];
  selectedStoryId: string;
  onSelectStory: (storyId: string) => void;
  onResetStories: () => void;
  onAddStoryToGrid: (story: SocialStory) => void;
  onCreateCustomStory: (
    title: string,
    category: SocialStory['category'],
    sentence: string,
    symbol: string
  ) => void;
  onUpdateStory: (updatedStory: SocialStory) => void;
}

export function SocialStoriesTab(props: SocialStoriesTabProps) {
  return <SocialStoryViewer {...props} />;
}
