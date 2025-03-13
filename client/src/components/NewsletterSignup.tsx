import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const newsletterSchema = z.object({
  email: z.string().email({
    message: "Vui lòng nhập một địa chỉ email hợp lệ.",
  }),
  consent: z.boolean().refine(val => val === true, {
    message: "Bạn cần đồng ý để tiếp tục.",
  }),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export default function NewsletterSignup() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
      consent: false,
    },
  });

  async function onSubmit(data: NewsletterFormValues) {
    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/newsletter/subscribe', data);
      toast({
        title: "Đăng ký thành công!",
        description: "Cảm ơn bạn đã đăng ký nhận tin từ CryptoViet.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Đăng ký không thành công",
        description: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-primary rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">Đăng ký nhận tin</h3>
        <p className="text-blue-100 text-sm mb-4">
          Nhận tin tức và phân tích mới nhất về thị trường tiền điện tử trực tiếp vào email của bạn.
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Email của bạn"
                      className="w-full px-4 py-2 rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-200 text-xs" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="consent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-1 data-[state=checked]:bg-white data-[state=checked]:text-primary"
                    />
                  </FormControl>
                  <FormLabel className="text-xs text-blue-100 font-normal cursor-pointer">
                    Tôi đồng ý nhận thông tin và tin tức từ CryptoViet. Bạn có thể hủy đăng ký bất cứ lúc nào.
                  </FormLabel>
                  <FormMessage className="text-red-200 text-xs" />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              className="w-full bg-white text-primary hover:bg-blue-50 font-medium py-2 rounded-md transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang đăng ký..." : "Đăng ký ngay"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
