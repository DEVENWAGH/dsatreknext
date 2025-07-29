import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Bot, Users } from 'lucide-react';
import { SmoothScroll } from '@/components/ui/smooth-scroll';
import AIDiscussion from './AIDiscussion';
import CommunityDiscussion from '@/components/community/ProblemDiscussion';

const ProblemDiscussion = ({ problem, editorRef }) => {
  const [activeTab, setActiveTab] = useState('ai');

  return (
    <div className="h-full w-full">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="h-full w-full flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI Discussion
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Community
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="flex-1 mt-0 h-full">
          <AIDiscussion problem={problem} editorRef={editorRef} />
        </TabsContent>

        <TabsContent value="community" className="flex-1 mt-0 h-full">
          <SmoothScroll className="h-full p-4 custom-scrollbar">
            <CommunityDiscussion problemId={problem.id} />
          </SmoothScroll>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProblemDiscussion;
