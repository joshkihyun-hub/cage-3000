import { PROJECT1_ITEMS } from '../../../shared/constants/project1-images';

export default function ProjectDetailPage({ params }) {
  const projectId = parseInt(params.id, 10);
  const project = PROJECT1_ITEMS.find(item => item.id === projectId);

  if (!project) {
    return <div className="text-center py-20">프로젝트를 찾을 수 없습니다</div>;
  }

  return (
    <div className="w-full">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold font-logo mb-2">{project.title}</h1>
        <p className="text-base text-gray-500 tracking-widest uppercase">{project.subtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
        {project.subImages.map((src, index) => (
          <div key={index} className="overflow-hidden">
            <img 
              src={src} 
              alt={`${project.title} detail image ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
