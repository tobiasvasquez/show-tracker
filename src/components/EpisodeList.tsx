import { useState, useEffect } from "react";
import { TVMazeShow, TVMazeEpisode, getShowEpisodes, getShowImage, getShowNetwork, stripHtml } from "@/lib/tvmaze";
import { Check, Calendar, ArrowLeft, Loader2 } from "lucide-react";
import { format, isPast, isToday } from "date-fns";

interface EpisodeListProps {
  show: TVMazeShow;
  watchedEpisodes: Set<number>;
  onToggleWatched: (episodeId: number) => void;
  onBack: () => void;
}

const EpisodeList = ({ show, watchedEpisodes, onToggleWatched, onBack }: EpisodeListProps) => {
  const [episodes, setEpisodes] = useState<TVMazeEpisode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getShowEpisodes(show.id)
      .then(setEpisodes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [show.id]);

  const watched = episodes.filter((e) => watchedEpisodes.has(e.id)).length;
  const image = getShowImage(show);

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to shows
      </button>

      <div className="flex gap-5 mb-8">
        {image && (
          <img src={image} alt={show.name} className="w-28 h-40 rounded-lg object-cover border border-border" />
        )}
        <div className="flex-1 space-y-2">
          <h2 className="text-2xl font-bold font-display text-foreground">{show.name}</h2>
          <p className="text-sm text-muted-foreground">
            {show.genres.join(", ")} · {getShowNetwork(show)}
          </p>
          {show.summary && (
            <p className="text-xs text-muted-foreground line-clamp-3">{stripHtml(show.summary)}</p>
          )}
          {episodes.length > 0 && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary font-medium">{watched}/{episodes.length}</span>
                <span className="text-muted-foreground">episodes watched</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${(watched / episodes.length) * 100}%` }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-2">
          {episodes.map((episode, i) => {
            const airDate = episode.airdate ? new Date(episode.airdate) : null;
            const aired = airDate ? isPast(airDate) || isToday(airDate) : false;
            const today = airDate ? isToday(airDate) : false;
            const isWatched = watchedEpisodes.has(episode.id);

            return (
              <div
                key={episode.id}
                className={`flex items-center gap-4 p-3 rounded-lg border transition-all duration-200 animate-fade-in ${
                  isWatched
                    ? "bg-watched/5 border-watched/20"
                    : today
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card border-border hover:border-muted-foreground/30"
                }`}
                style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <button
                  onClick={() => onToggleWatched(episode.id)}
                  disabled={!aired}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isWatched
                      ? "bg-watched text-watched-foreground"
                      : aired
                      ? "border-2 border-muted-foreground/30 hover:border-primary hover:text-primary"
                      : "border-2 border-border text-border cursor-not-allowed"
                  }`}
                >
                  {isWatched && <Check className="w-4 h-4" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-primary">
                      S{episode.season}E{episode.number ?? "?"}
                    </span>
                    {today && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                        TODAY
                      </span>
                    )}
                  </div>
                  <p className={`text-sm truncate ${isWatched ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {episode.name}
                  </p>
                </div>
                {airDate && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                    <Calendar className="w-3 h-3" />
                    {format(airDate, "MMM d, yyyy")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EpisodeList;
