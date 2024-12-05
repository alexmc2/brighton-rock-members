import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { GardenComment, GardenTaskWithDetails } from "@/types/garden";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
}

interface CommentWithUser extends GardenComment {
  user: {
    email: string;
    full_name: string | null;
  };
}

export async function getGardenTask(id: string) {
  try {
    const supabase = createServerComponentClient({ cookies });

    // First get the task with basic comment data
    const { data: task, error } = await supabase
      .from("garden_tasks")
      .select(`
        *,
        area:garden_areas(*),
        comments:garden_comments(
          id,
          comment,
          created_at,
          user_id
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching Garden Task:", error);
      return null;
    }

    // Then fetch user data for each comment
    if (task && task.comments) {
      const userIds = task.comments.map((comment: GardenComment) =>
        comment.user_id
      );

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

      if (!profilesError && profiles) {
        // Create a map of user_id to profile data
        const userMap = profiles.reduce<Record<string, Profile>>(
          (acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          },
          {},
        );

        // Attach user data to each comment
        task.comments = task.comments.map((
          comment: GardenComment,
        ): CommentWithUser => ({
          ...comment,
          user: userMap[comment.user_id] || { email: "Unknown User", full_name: null },
        }));
      }
    }

    return task as GardenTaskWithDetails;
  } catch (err) {
    console.error("Error fetching Garden Task:", err);
    return null;
  }
}
