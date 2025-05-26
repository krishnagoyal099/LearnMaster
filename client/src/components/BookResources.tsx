import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Book,
  Download,
  ChevronLeft,
  ChevronRight,
  Expand,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBookRecommendations, type BookResource } from "@/lib/books";

interface BookResourcesProps {
  subject: string;
}

export function BookResources({ subject }: BookResourcesProps) {
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fullViewMode, setFullViewMode] = useState(false);

  const { data: books, isLoading } = useQuery({
    queryKey: ["/api/books/recommendations", subject],
    queryFn: () => getBookRecommendations(subject),
    enabled: !!subject,
  });

  const handleBookSelect = (bookId: string) => {
    setSelectedBook(bookId);
    setCurrentPage(1);
  };

  const selectedBookData = books?.find((book) => book.id === selectedBook);

  const totalPages = selectedBookData?.totalPages || 350;

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center">
          <Book className="mr-2 h-5 w-5 text-green-500" />
          Book Resources
        </CardTitle>
        <div className="mt-3">
          <Select value={selectedBook} onValueChange={handleBookSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose the book" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>
                  Getting AI recommendations...
                </SelectItem>
              ) : books?.length === 0 ? (
                <SelectItem value="empty" disabled>
                  No books found
                </SelectItem>
              ) : (
                books?.map((book) => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.title} by {book.author}{" "}
                    {book.difficulty && `(${book.difficulty})`}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div
          className={`${
            fullViewMode ? "fixed inset-4 z-50 bg-background" : "h-96"
          } flex items-center justify-center relative`}
        >
          {selectedBookData ? (
            <div className="w-full h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                {selectedBookData.downloadUrl &&
                selectedBookData.downloadUrl.endsWith(".pdf") ? (
                  <iframe
                    src={selectedBookData.downloadUrl}
                    className="w-full h-full border-0"
                    title={selectedBookData.title}
                    style={{ border: "none" }}
                  />
                ) : (
                  <div className="text-center p-8">
                    <Book className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {selectedBookData.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      by {selectedBookData.author}
                    </p>
                    {selectedBookData.difficulty && (
                      <div className="mb-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            selectedBookData.difficulty === "Beginner"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : selectedBookData.difficulty === "Advanced"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          }`}
                        >
                          {selectedBookData.difficulty}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                      {selectedBookData.description}
                    </p>
                    <div className="space-y-2">
                      <Button asChild className="w-full">
                        <a
                          href={selectedBookData.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          {selectedBookData.downloadUrl.endsWith(".pdf")
                            ? "Open PDF"
                            : "Find PDF"}
                        </a>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(
                            `${selectedBookData.title} ${selectedBookData.author} filetype:pdf`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Find PDF on Google
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {!fullViewMode && (
                <Button
                  onClick={() => setFullViewMode(true)}
                  className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white"
                  size="sm"
                >
                  <Expand className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <Book className="h-12 w-12 mx-auto mb-2" />
              <p>Select a book to start reading</p>
            </div>
          )}

          {fullViewMode && (
            <Button
              onClick={() => setFullViewMode(false)}
              className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white"
              size="sm"
            >
              ✕
            </Button>
          )}
        </div>

        {selectedBookData && !fullViewMode && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 py-2 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <a
                href={selectedBookData.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
