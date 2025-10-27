import { render, screen } from '@testing-library/react';
import RirekishoPrintView from '@/components/RirekishoPrintView';

describe('RirekishoPrintView', () => {
  it('renders the resume heading and candidate details', () => {
    const data = {
      receptionDate: '2024-04-01',
      nameKanji: '山田 太郎',
      nameFurigana: 'やまだ たろう',
      birthday: '1990-06-15',
      gender: '男性',
      address: '東京都港区',
    };

    render(<RirekishoPrintView data={data} photoPreview={undefined} />);

    expect(screen.getByRole('heading', { name: '履歴書' })).toBeInTheDocument();
    expect(screen.getByText('山田 太郎')).toBeInTheDocument();
    expect(screen.getByText('やまだ たろう')).toBeInTheDocument();
    expect(screen.getByText('東京都港区')).toBeInTheDocument();
  });
});
