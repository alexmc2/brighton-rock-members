import React from 'react';
import {
  DevelopmentCategory,
  DevelopmentPriority,
  InitiativeType,
} from '@/types/development';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BaseInitiativeFormProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  category: DevelopmentCategory;
  setCategory: (value: DevelopmentCategory) => void;
  priority: DevelopmentPriority;
  setPriority: (value: DevelopmentPriority) => void;
  initiativeType: InitiativeType;
  disabled?: boolean;
}

export default function BaseInitiativeForm({
  title,
  setTitle,
  description,
  setDescription,
  category,
  setCategory,
  priority,
  setPriority,
  initiativeType,
  disabled = false,
}: BaseInitiativeFormProps) {
  return (
    <>
      {/* Title Field */}
      <div>
        <Label htmlFor="title" className="text-slate-900 dark:text-slate-300">Title</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder={`${
            initiativeType === 'event' ? 'Event' : 'Project'
          } title`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={disabled}
          className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
        />
      </div>

      {/* Description Field */}
      <div>
        <Label htmlFor="description" className="text-slate-900 dark:text-slate-300">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          placeholder={`Describe the ${initiativeType}`}
          className="resize-none bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={disabled}
        />
      </div>

      {/* Category Field */}
      <div>
        <Label htmlFor="category" className="text-slate-900 dark:text-slate-300">Category</Label>
        <Select
          value={category}
          onValueChange={(value: DevelopmentCategory) => setCategory(value)}
          disabled={disabled}
        >
          <SelectTrigger id="category" className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="development_meeting">Development Meeting</SelectItem>
            <SelectItem value="social">Social Event</SelectItem>
            <SelectItem value="outreach">Outreach</SelectItem>
            <SelectItem value="policy">Policy</SelectItem>
            <SelectItem value="training">Training</SelectItem>
            <SelectItem value="research">Research</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Priority Field */}
      <div>
        <Label htmlFor="priority" className="text-slate-900 dark:text-slate-300">Priority</Label>
        <Select
          value={priority}
          onValueChange={(value: DevelopmentPriority) => setPriority(value)}
          disabled={disabled}
        >
          <SelectTrigger id="priority" className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-700">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
